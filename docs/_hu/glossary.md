---
title: "Szójegyzék"
nav_order: 21
lang: "hu"
source: "glossary.md"
source_hash: "8766ecb57c96"
translated: true
outdated: true
---

# Szójegyzék

Az oldalon használt szavak rövid jelentése, egyszerű nyelven. Minden bejegyzés arra az oldalra mutat, amely teljes egészében elmagyarázza.

## Adat {#data}

**Sor.** Az adatának egy sora: egy dolog, amely egy helyen és időpontban történt, például „7-es játékos a 12. másodpercben itt volt”. A megjelenítő minden sort kirajzol. [Adatformátumok](data-formats.md)

**Oszlop.** Az adatsorok egyfajta értéke, például x, y, z, idő vagy csapat. A megjelenítő kitalálja, melyik oszlop mi, és a találgatást Ön módosíthatja. [Oszlop-hozzárendelés](column-mapping.md)

**CSV.** Egyszerű szöveges táblázat: egy sor soronként, az értékek vesszővel elválasztva. Szinte minden program tud ilyet írni. [Fájlok betöltése](loading-files.md)

**Parquet.** Tömör táblázatfájl, amely gyorsan olvasható, akár millió soránál is. Ez a legjobb formátum a megjelenítőnek. [Fájlok betöltése](loading-files.md)

**Esemény.** Valami, ami történt, például lövés, találat, gyilkosság vagy felszállás. Egy sor lehet esemény, vagy csak az, hogy „itt voltam”. [Szűrők](filters.md)

**Személy.** Az, aki a sorokat létrehozta: egy játékos, egy pilóta, egy autó vagy egy harckocsi. Egy személy egy pozíciósor az időben. [Munkamenetek, személyek és csoportok](sessions-persons-groups.md)

**Csoport (csapat).** Ugyanolyan színnel megjelenített személyek összessége, például Kék és Piros. [Munkamenetek, személyek és csoportok](sessions-persons-groups.md)

**Munkamenet (meccs, kör).** A játék egy futása. Egy meccs vagy egy kör munkamenet. A megjelenítő egy munkamenetet mutathat, vagy sokat rakhat egymásra. [Munkamenetek, személyek és csoportok](sessions-persons-groups.md)

**Pálya.** A 3D-s térkép, amelyen az adat történt: terep, épületek, falak. A sorok ott jelennek meg a pályán, ahol történtek. [Pályák és háttérgeometria](levels.md)

## Az adat nézése {#looking-at-the-data}

**Hőtérkép.** Olyan kép, amelyen ahol sok sor érint egy helyet, ott izzóbb a színe. A hideg helyek nyugodtak, a forró helyek elfoglaltak. [Hő](heat.md)

**Hő.** Mennyi történt egy helyen. A megjelenítő minden sor izzását összeadja minden helyen; az összeg a hő. [Hő](heat.md)

**Sprite.** Az a kis izzó folt, amelyet a megjelenítő egy sorhoz rajzol. Sok átfedő sprite összeadódik hővé. [Sprite-alak](sprite-shape.md)

**Expozíció.** Mennyire világos a kép. Mint egy kamerán: túl sok expozíció mindent fehérré tesz, túl kevés elrejti a részleteket. [Szín és expozíció](colour-and-exposure.md)

**Telítettség.** Az a hőmennyiség, amely „olyan forró, mint amilyenre a színek futnak”. Csökkentse, hogy a nyugodt helyek is láthatók legyenek; növelje, hogy csak a legforróbbakat lássa. [Szín és expozíció](colour-and-exposure.md)

**Térfogat.** Egy doboz vagy alakzat, amelyet a 3D-s nézetbe helyez. A megjelenítő megszámolja, mi van benne, és a térfogatokat egymással összehasonlíthatja. [Térfogatok és összehasonlítás](volumes.md)

**Szűrő.** Olyan szabály, amely elrejti a nem kívánt sorokat, például „csak gyilkosságok” vagy „csak a Piros csapat”. [Szűrők](filters.md)

## Visszajátszás {#replay}

**Figura.** Egy kis modell egy harckocsiról, repülőgépről, autóról vagy katonáról, amely oda mozog, ahová az adat szerint volt. [Figurák](figures.md)

**LOD (részletességi szint).** Minden figurának van egy részletes, egy egyszerűbb és egy nagyon egyszerű változata. A közeli figurák a részletesebbet, a távoliak az egyszerűbbet használják, így több ezer rajzolható egyszerre. [Figurák](figures.md)

## Versenyzés {#racing}

**Kör.** Egy út a pályán, a startvonaltól vissza a startvonalig. [Körök betöltése](race-loading-laps.md)

**Referenciakör.** Az a kör, amelyhez minden más kört hasonlítunk. A különbségek „gyorsabb” vagy „lassabb” jelöléssel jelennek meg. [Körök betöltése](race-loading-laps.md)

**Csúcspont.** A kanyar azon pontja, ahol az autó a belső szélhez a legközelebb van. [Kanyarról kanyarra elemzés](race-corner-analysis.md)

**Csúszás.** Mennyit csúszik a gumi. Egy kis csúszás adja a legnagyobb tapadást; túl sok esetén az autó megcsúszik. [Versenyelemzés: a módszer](race-analytics.md)

**Burkoló.** Amit az autó bármely sebességen tud: mennyire erősen tud kanyarodni, fékezni és gyorsulni, mielőtt megcsúszna. [Versenyelemzés: a módszer](race-analytics.md)

## Repülési számok {#aircraft-numbers}

**ALT.** Magasság: a talaj vagy a tengerszint feletti magasság. [Meccs-visszajátszás](match-replay.md#labels-and-statistics)

**TAS.** Valódi légisebesség: milyen gyorsan mozog a repülőgép a levegőben. [Meccs-visszajátszás](match-replay.md#labels-and-statistics)

## Számítógép {#computer}

**GPU.** A videokártya vagy chip. Ez rajzolja a képet, és sokkal gyorsabb, mint a főprocesszor, amikor millió izzó foltot kell rajzolni. [A két háttérrendszer](backends.md)

**WebGPU / WebGL2.** A két mód, ahogy a böngésző lehetővé teszi, hogy egy oldal használja a GPU-t. A WebGPU az újabb. A megjelenítő bármelyiket használhatja, és a böngészőjében elérhető legjobbat választja. [A két háttérrendszer](backends.md)

## Counter-Strike szavak {#counter-strike-words}

**Kör.** Egy rövid harc egy meccsen belül. Az egyik oldal nyeri, és az eredmény eggyel nő.

**Eco, kényszervásárlás, teljes vásárlás.** Mennyi pénzt költ egy oldal fegyverekre a kör elején. Az eco pénzt takarít meg, és alig vesz valamit (átlagosan játékosonként 1500 dollár alatt). A kényszervásárlás elkölti, amije van (4000 dollár alatt). A teljes vásárlás mindent megvesz, amit tud. [Meccselemzés](match-analysis.md)

**Csere.** Egy gyilkosság, amely visszafizet egy gyilkosságot: Önt lelövik, és egy csapattárs 5 másodpercen belül lövi le a gyilkosát. [Meccselemzés](match-analysis.md)

**KAST.** Azoknak a köröknek az aránya, amelyekben egy játékos gyilkosságot szerzett, segített, életben maradt vagy cserélt. Magasabb szám azt jelenti, hogy több körben segített. [Meccselemzés](match-analysis.md)

**ADR.** Átlagos sebzés körönként: mennyi életerőt vett el egy játékos az ellenségtől körönként. [Meccselemzés](match-analysis.md)
